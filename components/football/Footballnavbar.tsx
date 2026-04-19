"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompetitionMeta {
    name: string
    countryCode: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CODE3_TO_ISO2: Record<string, string> = {
    ENG: "GB",
    ESP: "ES",
    GER: "DE",
    ITA: "IT",
    FRA: "FR",
    NLD: "NL",
    POR: "PT",
    BRA: "BR",
}

const getFlagEmoji = (code3: string | null): string => {
    if (!code3) return "🌍"
    const iso2 = CODE3_TO_ISO2[code3]
    if (!iso2) return "🌍"
    return iso2
        .toUpperCase()
        .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

const competitionNavItems = (code: string) => [
    { label: "Overview", href: `/sports/football/${code}` },
    { label: "Standings", href: `/sports/football/${code}/standings` },
    { label: "Matches", href: `/sports/football/${code}/matches` },
    { label: "Scorers", href: `/sports/football/${code}/scorers` },
]

// ─── NavItem ─────────────────────────────────────────────────────────────────

const NavItem = ({
    label,
    href,
    isActive,
}: {
    label: string
    href: string
    isActive: boolean
}) => (
    <Link
        href={href}
        className="relative px-4 py-3.5 text-xs font-semibold tracking-widest uppercase whitespace-nowrap shrink-0 group transition-all duration-200"
        style={{
            fontFamily: "var(--font-display)",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
            borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
        }}
    >
        <span
            className="absolute inset-x-1 inset-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        />
        <span className="relative z-10 transition-colors duration-200 group-hover:text-white">
            {label}
        </span>
        {!isActive && (
            <span
                className="absolute bottom-0 left-2 right-2 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                style={{ backgroundColor: "var(--accent)" }}
            />
        )}
    </Link>
)

// ─── NavBar ───────────────────────────────────────────────────────────────────

const FootballNavBar = () => {
    const pathname = usePathname()
    const [competitionMeta, setCompetitionMeta] = useState<CompetitionMeta | null>(null)

    // Parse the active competition code from the URL
    const footballBase = "/sports/football/"
    const afterBase = pathname.startsWith(footballBase)
        ? pathname.slice(footballBase.length)
        : ""
    const firstSegment = afterBase.split("/")[0]
    const isCompetitionRoute =
        firstSegment.length > 0 &&
        firstSegment !== "teams" &&
        firstSegment !== "players"
    const activeCode = isCompetitionRoute ? firstSegment.toUpperCase() : null

    useEffect(() => {
        if (!activeCode) {
            setCompetitionMeta(null)
            return
        }
        fetch("/api/football/competitions")
            .then((r) => r.json())
            .then((data) => {
                const found = data.competitions?.find(
                    (c: { code: string; name: string; countryCode: string | null }) =>
                        c.code === activeCode
                )
                if (found) setCompetitionMeta({ name: found.name, countryCode: found.countryCode })
            })
            .catch(() => setCompetitionMeta(null))
    }, [activeCode])

    // Hide entirely on the landing/grid page
    if (pathname === "/sports/football") return null

    const flag = getFlagEmoji(competitionMeta?.countryCode ?? null)
    const competitionLabel = competitionMeta
        ? `${flag} ${competitionMeta.name}`
        : activeCode ?? ""

    return (
        <div
            className="mb-2 sticky z-40 border-b border-white/5"
            style={{
                top: "56px",
                backgroundColor: "#0a0a0a",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className="flex items-center overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                >
                    {/* FOOTBALL badge */}
                    <Link
                        href="/sports/football"
                        className="flex items-center gap-2 pr-5 mr-1 shrink-0"
                        style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <div
                            className="px-2 py-0.5 text-white font-bold text-sm"
                            style={{
                                backgroundColor: "var(--accent)",
                                fontFamily: "var(--font-display)",
                                letterSpacing: "0.05em",
                            }}
                        >
                            FOOTBALL
                        </div>
                    </Link>

                    {/* Competitions back link */}
                    {/* <NavItem
                        label="Competitions"
                        href="/sports/football"
                        isActive={false}
                    /> */}

                    {/* Competition breadcrumb + sub-links */}
                    {activeCode && (
                        <>
                            {/* <span
                                className="shrink-0 mx-1"
                                style={{
                                    color: "rgba(255,255,255,0.2)",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "14px",
                                }}
                            >
                                /
                            </span> */}

                            {/* Competition name pill */}
                            <span
                                className="shrink-0 px-3 py-1 mr-2 whitespace-nowrap"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    color: "var(--accent)",
                                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                                    backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)",
                                    letterSpacing: "0.04em",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                }}
                            >
                                {competitionLabel}
                            </span>

                            {/* Vertical separator */}
                            <div
                                className="shrink-0 mx-2"
                                style={{
                                    width: "1px",
                                    height: "16px",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                }}
                            />

                            {/* Overview / Standings / Matches / Scorers */}
                            {competitionNavItems(activeCode).map((item) => {
                                const isActive =
                                    item.href === `/sports/football/${activeCode}`
                                        ? pathname === item.href
                                        : pathname.startsWith(item.href)
                                return (
                                    <NavItem
                                        key={item.href}
                                        label={item.label}
                                        href={item.href}
                                        isActive={isActive}
                                    />
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FootballNavBar