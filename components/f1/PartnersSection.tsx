"use client"

import Link from "next/link"

const partners = [
    // Title Partners
    { name: "ARAMCO", tier: "title", color: "#00A3E0" },
    { name: "AWS", tier: "title", color: "#FF9900" },
    { name: "LVMH", tier: "title", color: "#C5A028" },

    // Global Partners
    { name: "PIRELLI", tier: "global", color: "#FFCC00" },
    { name: "DHL", tier: "global", color: "#FC0" },
    { name: "ROLEX", tier: "global", color: "#B09255" },
    { name: "HEINEKEN", tier: "global", color: "#008200" },
    { name: "MSC", tier: "global", color: "#2B6CB0" },
    { name: "QATAR AIRWAYS", tier: "global", color: "#5C0632" },

    // Official Suppliers
    { name: "SALESFORCE", tier: "official", color: "#00A1E0" },
    { name: "STC", tier: "official", color: "#7B2D8B" },
    { name: "PUMA", tier: "official", color: "#FFFFFF" },
]

const PartnerLogo = ({ partner }: { partner: typeof partners[0] }) => (
    <div
        className="flex items-center justify-center px-6 py-5 transition-all duration-300 hover:bg-white/5 group"
        style={{ border: "1px solid rgba(255,255,255,0.04)" }}
    >
        <span
            className="font-bold tracking-widest text-sm transition-all duration-300 group-hover:opacity-100"
            style={{
                fontFamily: "var(--font-display)",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.15em",
            }}
            onMouseEnter={e => {
                (e.target as HTMLElement).style.color = partner.color
            }}
            onMouseLeave={e => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"
            }}
        >
            {partner.name}
        </span>
    </div>
)

const PartnersSection = () => {
    const title = partners.filter(p => p.tier === "title")
    const global = partners.filter(p => p.tier === "global")
    const official = partners.filter(p => p.tier === "official")

    return (
        <div>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-[var(--color-f1-red)]" />
                <h2
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                >
                    OUR PARTNERS
                </h2>
            </div>

            {/* Title partners */}
            <div className="mb-1">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20 mb-3 text-center">
                    Title Partners
                </p>
                <div className="grid grid-cols-3">
                    {title.map(p => <PartnerLogo key={p.name} partner={p} />)}
                </div>
            </div>

            {/* Global partners */}
            <div className="mb-1 mt-1">
                <p
                    className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20 mb-3 mt-4"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Global Partners
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6">
                    {global.map(p => <PartnerLogo key={p.name} partner={p} />)}
                </div>
            </div>

            {/* Official suppliers */}
            <div className="mt-1">
                <p
                    className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20 mb-3 mt-4"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Official Suppliers
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6">
                    {official.map(p => <PartnerLogo key={p.name} partner={p} />)}
                </div>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <p
                    className="text-[10px] tracking-widest uppercase text-white/15"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Official Partners of the FIA Formula One World Championship
                </p>
            </div>
        </div>
    )
}

export default PartnersSection