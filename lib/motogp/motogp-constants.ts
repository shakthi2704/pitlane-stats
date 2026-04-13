

export const FALLBACK_RIDER = "/F1/drivers/driver-placeholder.png"


export const CURRENT_SEASON = new Date().getFullYear().toString()

export const MOTOGP_AVAILABLE_SEASONS = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => String(new Date().getFullYear() - i)
)

export const MOTOGP_RED = "#E3001B"

export const MOTOGP_CATEGORIES = ["MotoGP", "Moto2", "Moto3"] as const
export type MotoGPCategory = typeof MOTOGP_CATEGORIES[number]