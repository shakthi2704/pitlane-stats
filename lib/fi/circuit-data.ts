export interface CircuitStaticData {
    length: string        // "5.412 km"
    laps: number
    lapRecord: string     // "1:31.447"
    lapRecordHolder: string
    lapRecordYear: number
    corners: number
    drsZones: number
    firstGP: number
    geojson: string       // filename in public/circuits/geojson/
}

export const CIRCUIT_STATIC: Record<string, CircuitStaticData> = {
    bahrain: {
        length: "5.412 km", laps: 57, lapRecord: "1:31.447",
        lapRecordHolder: "Pedro de la Rosa", lapRecordYear: 2005,
        corners: 15, drsZones: 3, firstGP: 2004,
        geojson: "Sakhir - Bahrain International Circuit.geojson",
    },
    jeddah: {
        length: "6.174 km", laps: 50, lapRecord: "1:30.734",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2021,
        corners: 27, drsZones: 3, firstGP: 2021,
        geojson: "Jeddah - Jeddah Corniche Circuit.geojson",
    },
    albert_park: {
        length: "5.278 km", laps: 58, lapRecord: "1:20.235",
        lapRecordHolder: "Charles Leclerc", lapRecordYear: 2022,
        corners: 16, drsZones: 4, firstGP: 1996,
        geojson: "Melbourne - Albert Park Circuit.geojson",
    },
    suzuka: {
        length: "5.807 km", laps: 53, lapRecord: "1:30.983",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2019,
        corners: 18, drsZones: 2, firstGP: 1987,
        geojson: "Suzuka - Suzuka International Racing Course.geojson",
    },
    shanghai: {
        length: "5.451 km", laps: 56, lapRecord: "1:32.238",
        lapRecordHolder: "Michael Schumacher", lapRecordYear: 2004,
        corners: 16, drsZones: 2, firstGP: 2004,
        geojson: "Shanghai - Shanghai International Circuit.geojson",
    },
    miami: {
        length: "5.412 km", laps: 57, lapRecord: "1:29.708",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2023,
        corners: 19, drsZones: 3, firstGP: 2022,
        geojson: "Miami - Miami International Autodrome.geojson",
    },
    imola: {
        length: "4.909 km", laps: 63, lapRecord: "1:15.484",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2022,
        corners: 19, drsZones: 2, firstGP: 1980,
        geojson: "Imola - Autodromo Enzo e Dino Ferrari.geojson",
    },
    monaco: {
        length: "3.337 km", laps: 78, lapRecord: "1:12.909",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2021,
        corners: 19, drsZones: 1, firstGP: 1950,
        geojson: "Monaco - Circuit de Monaco.geojson",
    },
    villeneuve: {
        length: "4.361 km", laps: 70, lapRecord: "1:13.078",
        lapRecordHolder: "Valtteri Bottas", lapRecordYear: 2019,
        corners: 14, drsZones: 3, firstGP: 1978,
        geojson: "Montreal - Circuit Gilles-Villeneuve.geojson",
    },
    catalunya: {
        length: "4.657 km", laps: 66, lapRecord: "1:18.149",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2021,
        corners: 16, drsZones: 2, firstGP: 1991,
        geojson: "Barcelona - Circuit de Barcelona-Catalunya.geojson",
    },
    red_bull_ring: {
        length: "4.318 km", laps: 71, lapRecord: "1:05.619",
        lapRecordHolder: "Carlos Sainz", lapRecordYear: 2020,
        corners: 10, drsZones: 3, firstGP: 1970,
        geojson: "Spielberg - Red Bull Ring.geojson",
    },
    silverstone: {
        length: "5.891 km", laps: 52, lapRecord: "1:27.097",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2020,
        corners: 18, drsZones: 2, firstGP: 1950,
        geojson: "Silverstone - Silverstone Circuit.geojson",
    },
    hungaroring: {
        length: "4.381 km", laps: 70, lapRecord: "1:16.627",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2020,
        corners: 14, drsZones: 2, firstGP: 1986,
        geojson: "Budapest - Hungaroring.geojson",
    },
    spa: {
        length: "7.004 km", laps: 44, lapRecord: "1:46.286",
        lapRecordHolder: "Valtteri Bottas", lapRecordYear: 2018,
        corners: 19, drsZones: 2, firstGP: 1950,
        geojson: "Spa Francorchamps - Circuit de Spa-Francorchamps.geojson",
    },
    zandvoort: {
        length: "4.259 km", laps: 72, lapRecord: "1:11.097",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2021,
        corners: 14, drsZones: 2, firstGP: 1952,
        geojson: "Zandvoort - Circuit Zandvoort.geojson",
    },
    monza: {
        length: "5.793 km", laps: 51, lapRecord: "1:21.046",
        lapRecordHolder: "Rubens Barrichello", lapRecordYear: 2004,
        corners: 11, drsZones: 2, firstGP: 1950,
        geojson: "Monza - Autodromo Nazionale Monza.geojson",
    },
    baku: {
        length: "6.003 km", laps: 51, lapRecord: "1:43.009",
        lapRecordHolder: "Charles Leclerc", lapRecordYear: 2019,
        corners: 20, drsZones: 2, firstGP: 2016,
        geojson: "Baku - Baku City Circuit.geojson",
    },
    marina_bay: {
        length: "4.940 km", laps: 62, lapRecord: "1:35.867",
        lapRecordHolder: "Lewis Hamilton", lapRecordYear: 2023,
        corners: 23, drsZones: 3, firstGP: 2008,
        geojson: "Singapore - Marina Bay Street Circuit.geojson",
    },
    americas: {
        length: "5.513 km", laps: 56, lapRecord: "1:36.169",
        lapRecordHolder: "Charles Leclerc", lapRecordYear: 2019,
        corners: 20, drsZones: 2, firstGP: 2012,
        geojson: "Austin - Circuit of the Americas.geojson",
    },
    rodriguez: {
        length: "4.304 km", laps: 71, lapRecord: "1:17.774",
        lapRecordHolder: "Valtteri Bottas", lapRecordYear: 2021,
        corners: 17, drsZones: 3, firstGP: 1963,
        geojson: "Mexico City - Autódromo Hermanos Rodríguez.geojson",
    },
    interlagos: {
        length: "4.309 km", laps: 71, lapRecord: "1:10.540",
        lapRecordHolder: "Rubens Barrichello", lapRecordYear: 2004,
        corners: 15, drsZones: 2, firstGP: 1973,
        geojson: "Sao Paulo - Autódromo José Carlos Pace - Interlagos.geojson",
    },
    las_vegas: {
        length: "6.201 km", laps: 50, lapRecord: "1:35.490",
        lapRecordHolder: "Oscar Piastri", lapRecordYear: 2024,
        corners: 17, drsZones: 2, firstGP: 2023,
        geojson: "Las Vegas - Las Vegas Street Circuit.geojson",
    },
    losail: {
        length: "5.380 km", laps: 57, lapRecord: "1:24.319",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2023,
        corners: 16, drsZones: 2, firstGP: 2021,
        geojson: "Lusail - Losail International Circuit.geojson",
    },
    yas_marina: {
        length: "5.281 km", laps: 58, lapRecord: "1:26.103",
        lapRecordHolder: "Max Verstappen", lapRecordYear: 2021,
        corners: 16, drsZones: 2, firstGP: 2009,
        geojson: "Yas Marina - Yas Marina Circuit.geojson",
    },
}