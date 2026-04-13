"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"



const navItems = [
    { label: "Overview", href: "/sports/motogp" },
    { label: "Schedule", href: "/sports/motogp/races" },
    { label: "Results", href: "/sports/motogp/results" },
    { label: "Standings", href: "/sports/motogp/standings/riders" },
    { label: "Constructor Standings", href: "/sports/motogp/standings/riders" },
    { label: "Riders", href: "/sports/motogp/riders" },
    { label: "Teams", href: "/sports/motogp/teams" },
    { label: "Circuits", href: "/sports/motogp/circuits" },
    { label: "News", href: "/sports/motogp/news" },
]

const MotoGPNavBar = () => {
    const pathname = usePathname()

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
                    className="flex items-center justify-center overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                >
                    {/* MotoGP badge */}
                    <Link
                        href="/sports/motogp"
                        className="flex items-center gap-2 pr-5 mr-2 shrink-0"
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
                            MOTOGP
                        </div>
                    </Link>

                    {/* Nav items */}
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/sports/motogp"
                                ? pathname === "/sports/motogp"
                                : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative px-4 py-3.5 text-xs font-semibold tracking-widest uppercase whitespace-nowrap shrink-0 group transition-all duration-200"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                                    borderBottom: isActive
                                        ? `2px solid var(--accent)`
                                        : "2px solid transparent",
                                }}
                            >
                                {/* Hover bg pill */}
                                <span
                                    className="absolute inset-x-1 inset-y-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                />

                                {/* Label */}
                                <span className="relative z-10 transition-colors duration-200 group-hover:text-white">
                                    {item.label}
                                </span>

                                {/* Hover underline for inactive */}
                                {!isActive && (
                                    <span
                                        className="absolute bottom-0 left-2 right-2 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default MotoGPNavBar