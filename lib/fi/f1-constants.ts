export const REGIONAL_PARTNERS = [
    { name: "Puma", file: "puma.avif" },
    { name: "TATA", file: "tata.avif" },
    { name: "Aggreko", file: "aggreko.avif" },
    { name: "McDonald's", file: "mcdonalds.avif" },
    { name: "T-Mobile", file: "t-mobile.avif" },
    { name: "Fanatec", file: "fanatec.avif" },
];
export const GLOBAL_PARTNERS = [
    { name: "LVMH", file: "LVMH.avif" },
    { name: "Pirelli", file: "Pirelli.avif" },
    { name: "Aramco", file: "aramco.avif" },
    { name: "AWS", file: "aws-black.avif" },
    { name: "Lenovo", file: "Lenovo.avif" },
    { name: "DHL", file: "DHL.avif" },
    { name: "Qatar Airways", file: "qatar-airways.avif" },
    { name: "MSC", file: "MSC.avif" },
    { name: "Salesforce", file: "salesforce.avif" },
    { name: "Heineken", file: "Heineken.avif" },
]

export const OFFICIAL_PARTNERS = [
    { name: "Louis Vuitton", file: "louis-vuitton.avif" },
    { name: "TAG Heuer", file: "tag.avif" },
    { name: "American Express", file: "american-express.avif" },
    { name: "PepsiCo", file: "pepsico.avif" },
    { name: "Crypto.com", file: "crypto.avif" },
    { name: "Standard Chartered", file: "standard-chartered.avif" },
    { name: "Santander", file: "santander.avif" },
    { name: "Globant", file: "globant.avif" },
    { name: "Allwyn", file: "allwyn.avif" },
    { name: "PwC", file: "pwc.avif" },
    { name: "Nestlé", file: "nestle.avif" },
    { name: "Barilla", file: "barilla.avif" },
    { name: "Las Vegas", file: "las-vegas.avif" },
    { name: "Liqui Moly", file: "liqui-moly.avif" },
    { name: "Paramount+", file: "paramount.avif" },
    { name: "Moët", file: "moet.avif" },
]

export const TEAM_SHORT: Record<string, string> = {
    mclaren: "MCL", mercedes: "MER", red_bull: "RBR", ferrari: "FER",
    williams: "WIL", rb: "RB", aston_martin: "AM", haas: "HAA",
    kick_sauber: "SAU", alpine: "ALP",
}


export const DRIVER_IMAGES: Record<string, string> = {
    albon: "/F1/drivers/alexander-albon.avif",
    lindblad: "/F1/drivers/arvid-lindblad.avif",
    sainz: "/F1/drivers/carlos-sainz.avif",
    leclerc: "/F1/drivers/charles-leclerc.avif",
    ocon: "/F1/drivers/esteban-ocon.avif",
    alonso: "/F1/drivers/fernando-alonso.avif",
    colapinto: "/F1/drivers/franco-colapinto.avif",
    bortoleto: "/F1/drivers/gabriel-bortoleto.avif",
    russell: "/F1/drivers/george-russell.avif",
    hadjar: "/F1/drivers/isack-hadjar.avif",
    antonelli: "/F1/drivers/kimi-antonelli.avif",
    stroll: "/F1/drivers/lance-stroll.avif",
    norris: "/F1/drivers/lando-norris.avif",
    hamilton: "/F1/drivers/lewis-hamilton.avif",
    lawson: "/F1/drivers/liam-lawson.avif",
    max_verstappen: "/F1/drivers/max-verstappen.avif",
    hulkenberg: "/F1/drivers/nico-hulkenberg.avif",
    bearman: "/F1/drivers/oliver-bearman.avif",
    piastri: "/F1/drivers/oscar-piastri.avif",
    gasly: "/F1/drivers/pierre-gasly.avif",
    perez: "/F1/drivers/sergio-perez.avif",
    bottas: "/F1/drivers/valtteri-bottas.avif",
    Doohan: "/F1/drivers/jack-doohan.avif",
};

export const TEAM_CARS: Record<string, string> = {
    mclaren: "/F1/team/2026mclarencarright.avif",
    mercedes: "/F1/team/2026mercedescarright.avif",
    red_bull: "/F1/team/2026redbullracingcarright.avif",
    ferrari: "/F1/team/2026ferraricarright.avif",
    williams: "/F1/team/2026williamscarright.avif",
    rb: "/F1/team/2026racingbullscarright.avif",
    aston_martin: "/F1/team/2026astonmartincarright.avif",
    haas: "/F1/team/2026haascarright.avif",
    kick_sauber: "/F1/team/2026audicarright.avif",
    alpine: "/F1/team/2026alpinecarright.avif",
}

export const TEAM_LOGOS: Record<string, string> = {
    mclaren: "/F1/logos/mclarenlogowhite.webp",
    mercedes: "/F1/logos/mercedeslogowhite.webp",
    red_bull: "/F1/logos/redbullracinglogowhite.webp",
    ferrari: "/F1/logos/ferrarilogolight.webp",
    williams: "/F1/logos/williamslogowhite.webp",
    rb: "/F1/logos/racingbullslogowhite.webp",
    aston_martin: "/F1/logos/astonmartinlogowhite.webp",
    haas: "/F1/logos/haaslogowhite.webp",
    kick_sauber: "/F1/logos/audilogowhite.webp",
    alpine: "/F1/logos/alpinelogowhite.webp",
}

export const FALLBACK_DRIVER = "/F1/drivers/driver-placeholder.png"
export const FALLBACK_CAR = "/F1/drivers/placeholder.svg"
export const FALLBACK_LOGO = "/F1/logos/formula-1-log.png"

export const PODIUM = {
    colors: ["#F5C842", "#C0C0C0", "#CD7F32"],
    labels: ["1ST", "2ND", "3RD"],
    heights: ["240px", "210px", "200px"],
}

export const CIRCUIT_COLORS: Record<string, string> = {
    bahrain: "#E10600",
    jeddah: "#00B4D8",
    albert_park: "#2ECC71",
    suzuka: "#FF6B00",
    shanghai: "#F5C842",
    miami: "#00A3E0",
    imola: "#E10600",
    monaco: "#F5C842",
    villeneuve: "#FF0000",
    catalunya: "#FFCC00",
    red_bull_ring: "#1E90FF",
    silverstone: "#CCCCCC",
    hungaroring: "#E10600",
    spa: "#00A651",
    zandvoort: "#FF6B00",
    monza: "#E10600",
    baku: "#00B4D8",
    marina_bay: "#F5C842",
    americas: "#FF6B00",
    rodriguez: "#2ECC71",
    interlagos: "#00A651",
    las_vegas: "#F5C842",
    losail: "#00B4D8",
    yas_marina: "#1E90FF",
    madrid: "#E10600",
}

export const CURRENT_SEASON = "2025"
export const AVAILABLE_SEASONS = Array.from({ length: 8 }, (_, i) => String(2025 - i))



