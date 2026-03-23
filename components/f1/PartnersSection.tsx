import Link from "next/link"

const globalPartners = [
    { name: "LVMH", file: "lvmh.avif" },
    { name: "Pirelli", file: "pirelli.avif" },
    { name: "Aramco", file: "aramco.avif" },
    { name: "AWS", file: "aws-black.avif" },
    { name: "Lenovo", file: "lenovo.avif" },
    { name: "DHL", file: "dhl.avif" },
    { name: "Qatar Airways", file: "qatar-airways.avif" },
    { name: "MSC", file: "msc.avif" },
    { name: "Salesforce", file: "salesforce.avif" },
    { name: "Heineken", file: "heineken.avif" },
]

const officialPartners = [
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

const regionalPartners = [
    { name: "Puma", file: "puma.avif" },
    { name: "TATA", file: "tata.avif" },
    { name: "Aggreko", file: "aggreko.avif" },
    { name: "McDonald's", file: "mcdonalds.avif" },
    { name: "T-Mobile", file: "t-mobile.avif" },
    { name: "Fanatec", file: "fanatec.avif" },
]

interface PartnerLogoProps {
    name: string
    file: string
    folder: string
    size?: "lg" | "md" | "sm"
}

const PartnerLogo = ({ name, file, folder, size = "md" }: PartnerLogoProps) => {
    const heights: Record<string, string> = { lg: "32px", md: "24px", sm: "20px" }

    return (
        <div
            title={name}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 24px",
                transition: "background-color 0.2s",
                cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
            <img
                src={`/F1/partners/${folder}/${file}`}
                alt={name}
                style={{
                    height: heights[size],
                    width: "auto",
                    maxWidth: "110px",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                    opacity: 0.5,
                    transition: "opacity 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.opacity = "0.9"}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.opacity = "0.5"}
                onError={e => {
                    const img = e.target as HTMLImageElement
                    img.replaceWith(Object.assign(document.createElement("span"), {
                        textContent: name,
                        style: "font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;",
                    }))
                }}
            />
        </div>
    )
}

const PartnersSection = () => {
    return (
        <div>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "28px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "4px", height: "24px", backgroundColor: "var(--color-f1-red)" }} />
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                        }}
                    >
                        OUR PARTNERS
                    </h2>
                </div>
                <Link
                    href="#"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        textDecoration: "none",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                >
                    View All →
                </Link>
            </div>

            {/* Global Partners — 5 per row, larger logos */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "1px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                    {globalPartners.map(p => (
                        <PartnerLogo key={p.name} name={p.name} file={p.file} folder="global-partners" size="lg" />
                    ))}
                </div>
            </div>

            {/* Official Partners — 8 per row */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "1px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                    {officialPartners.map(p => (
                        <PartnerLogo key={p.name} name={p.name} file={p.file} folder="official-partners" size="md" />
                    ))}
                </div>
            </div>

            {/* Regional Partners — slightly different bg */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
                    {regionalPartners.map(p => (
                        <PartnerLogo key={p.name} name={p.name} file={p.file} folder="regional-partners" size="sm" />
                    ))}
                </div>
            </div>

            {/* Footer note */}
            <p
                style={{
                    textAlign: "center",
                    marginTop: "16px",
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.12)",
                    fontFamily: "var(--font-display)",
                }}
            >
                Official Partners of the FIA Formula One World Championship
            </p>
        </div>
    )
}

export default PartnersSection