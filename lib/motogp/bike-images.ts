// ─── MotoGP Bike Images ────────────────────────────────────────────────────────
// Files live in public/motogp/bikes/
// Renamed to: {number}-{class}.png  e.g. 93-MGP.png, 04-M2.png, 05-M3.png
//
// Each file is the specific rider's bike with their team livery.
// The rider number is unique per class so it's the right key.
//
// Placeholders (from your provided images):
//   placeholder-MGP.png  ← Grayscale MotoGP motorcycle with sleek design
//   placeholder.png      ← Sleek white sport motorcycle (generic fallback)

// ─── Rider bikes ─────────────────────────────────────────────────────────────
// Key: "{riderNumber}-{class}"   class = MGP | M2 | M3

export const MOTOGP_BIKE_IMAGES: Record<string, string> = {
    // ── MotoGP ──────────────────────────────────────────────────────────────
    "5-MGP": "/motogp/bikes/05-MGP.png",   // Johann Zarco
    "7-MGP": "/motogp/bikes/07-MGP.png",   // Toprak Razgatlioglu
    "10-MGP": "/motogp/bikes/10-MGP.png",   // Luca Marini
    "12-MGP": "/motogp/bikes/12-MGP.png",   // Maverick Viñales
    "25-MGP": "/motogp/bikes/25-MGP.png",   // Raul Fernandez
    "33-MGP": "/motogp/bikes/33-MGP.png",   // Brad Binder (Bike_MotoGP_2026-33_1.png)
    "37-MGP": "/motogp/bikes/37-MGP.png",   // Pedro Acosta
    "72-MGP": "/motogp/bikes/72-MGP.png",   // Marco Bezzecchi
    "73-MGP": "/motogp/bikes/73-MGP.png",   // Alex Marquez
    "93-MGP": "/motogp/bikes/93-MGP.png",   // Marc Marquez

    // ── Moto2 ────────────────────────────────────────────────────────────────
    "4-M2": "/motogp/bikes/04-M2.png",    // Ivan Ortola
    "7-M2": "/motogp/bikes/07-M2.png",    // Barry Baltus
    "9-M2": "/motogp/bikes/09-M2.png",    // Jorge Navarro
    "12-M2": "/motogp/bikes/12-M2.png",    // Filip Salac
    "13-M2": "/motogp/bikes/13-M2.png",    // Celestino Vietti
    "18-M2": "/motogp/bikes/18-M2.png",    // Manuel Gonzalez
    "21-M2": "/motogp/bikes/21-M2.png",    // Alonso Lopez
    "44-M2": "/motogp/bikes/44-M2.png",    // Aron Canet
    "71-M2": "/motogp/bikes/71-M2.png",    // Ayumu Sasaki
    "72-M2": "/motogp/bikes/72-M2.png",    // Taiyo Furusato
    "95-M2": "/motogp/bikes/95-M2.png",    // Collin Veijer
    "99-M2": "/motogp/bikes/99-M2.png",    // Adrian Huertas

    // ── Moto3 ────────────────────────────────────────────────────────────────
    "5-M3": "/motogp/bikes/05-M3.png",    // Leo Rammerstorfer
    "6-M3": "/motogp/bikes/06-M3.png",    // Ryusei Yamanaka
    "8-M3": "/motogp/bikes/08-M3.png",    // Eddie O'Shea
    "9-M3": "/motogp/bikes/09-M3.png",    // Veda Pratama
    "10-M3": "/motogp/bikes/10-M3.png",    // Nicola Carraro
    "11-M3": "/motogp/bikes/11-M3.png",    // Adrian Cruces
    "18-M3": "/motogp/bikes/18-M3.png",    // Matteo Bertelle
    "21-M3": "/motogp/bikes/21-M3.png",    // Ruche Moodley
    "22-M3": "/motogp/bikes/22-M3.png",    // David Almansa
    "27-M3": "/motogp/bikes/27-M3.png",    // Rico Salmela
    "28-M3": "/motogp/bikes/28-M3.png",    // Maximo Quiles
    "31-M3": "/motogp/bikes/31-M3.png",    // Adrian Fernandez
}

// ─── Team bikes ───────────────────────────────────────────────────────────────
// Key = team name exactly as stored in MotoGPTeam.name in the DB.
// Shows the most recognisable rider's bike for that team.
// Update these as you confirm exact DB team names.

export const MOTOGP_TEAM_BIKES: Record<string, string> = {
    // MotoGP
    "Ducati Lenovo Team": "/motogp/bikes/93-MGP.png",  // Marc Marquez
    "Gresini Racing MotoGP": "/motogp/bikes/73-MGP.png",  // Alex Marquez
    "BK8 Gresini Racing MotoGP": "/motogp/bikes/73-MGP.png",  // Alex Marquez
    "Prima Pramac Racing": "/motogp/bikes/05-MGP.png",  // Johann Zarco
    "Pertamina Enduro VR46 Racing Team": "/motogp/bikes/72-MGP.png",  // Marco Bezzecchi
    "Monster Energy Yamaha MotoGP": "/motogp/bikes/12-MGP.png",  // Maverick Viñales
    "Red Bull KTM Factory Racing": "/motogp/bikes/37-MGP.png",  // Pedro Acosta
    "Red Bull KTM Tech3": "/motogp/bikes/12-MGP.png",  // Raul Fernandez
    "Trackhouse MotoGP Team": "/motogp/bikes/25-MGP.png",
    "Aprilia Racing": "/motogp/bikes/25-MGP.png",
    "Honda Hrc Castrol": "/motogp/bikes/10-MGP.png",  // Luca Marini
    "LCR Honda": "/motogp/bikes/10-MGP.png",
    "BMW M Motorrad Motorsport": "/motogp/bikes/07-MGP.png",  // Toprak Razgatlioglu
}

// ─── Constructor bikes ────────────────────────────────────────────────────────
// One representative bike per manufacturer — used on constructor standings cards.

export const MOTOGP_CONSTRUCTOR_BIKES: Record<string, string> = {
    "Ducati": "/motogp/bikes/93-MGP.png",  // Marc Marquez
    "Honda": "/motogp/bikes/10-MGP.png",  // Luca Marini
    "Yamaha": "/motogp/bikes/12-MGP.png",  // Maverick Viñales
    "KTM": "/motogp/bikes/37-MGP.png",  // Pedro Acosta
    "Aprilia": "/motogp/bikes/25-MGP.png",  // Raul Fernandez
    "BMW": "/motogp/bikes/07-MGP.png",  // Toprak Razgatlioglu
    "Kalex": "/motogp/bikes/44-M2.png",
    "Triumph": "/motogp/bikes/71-M2.png",
    "CFMoto": "/motogp/bikes/95-M2.png",
}

// ─── Placeholders ─────────────────────────────────────────────────────────────

export const MOTOGP_BIKE_PLACEHOLDER_MGP = "/motogp/bikes/placeholder-MGP.png"
export const MOTOGP_BIKE_PLACEHOLDER = "/motogp/bikes/placeholder-MGP.png"

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BikeClass = "MGP" | "M2" | "M3"

function categoryToBikeClass(category: string): BikeClass {
    const c = category.toLowerCase()
    if (c.includes("moto2") || c === "m2") return "M2"
    if (c.includes("moto3") || c === "m3") return "M3"
    return "MGP"
}

/**
 * Get a rider's specific bike image by race number + category.
 * category can be "MotoGP™", "Moto2™", "Moto3™", "MGP", "M2", "M3"
 */
export function getBikeImage(
    number: number | null | undefined,
    category: string
): string {
    if (!number) return MOTOGP_BIKE_PLACEHOLDER
    const cls = categoryToBikeClass(category)
    const key = `${number}-${cls}`
    return MOTOGP_BIKE_IMAGES[key] ?? MOTOGP_BIKE_PLACEHOLDER
}

/**
 * Get a team's representative bike by team name.
 * Falls back to constructor bike, then placeholder.
 */
export function getTeamBike(
    teamName: string | null | undefined,
    constructorName?: string | null
): string {
    if (teamName && MOTOGP_TEAM_BIKES[teamName]) return MOTOGP_TEAM_BIKES[teamName]
    if (constructorName && MOTOGP_CONSTRUCTOR_BIKES[constructorName]) return MOTOGP_CONSTRUCTOR_BIKES[constructorName]
    return MOTOGP_BIKE_PLACEHOLDER
}

/**
 * Get a manufacturer's representative bike by constructor name.
 */
export function getConstructorBike(constructorName: string): string {
    return MOTOGP_CONSTRUCTOR_BIKES[constructorName] ?? MOTOGP_BIKE_PLACEHOLDER
}