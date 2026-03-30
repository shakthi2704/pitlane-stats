import {
  GLOBAL_PARTNERS,
  OFFICIAL_PARTNERS,
  REGIONAL_PARTNERS,
} from "@/lib/fi/f1-constants"
import Link from "next/link"
interface PartnerLogoProps {
  name: string
  file: string
  folder: string
  size?: "lg" | "md" | "sm"
}

const PartnerLogo = ({ name, file, folder, size = "md" }: PartnerLogoProps) => {
  const heights: Record<string, string> = { lg: "64px", md: "48px", sm: "32px" }

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
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(255,255,255,0.04)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
      }
    >
      <img
        src={`/F1/partners/${folder}/${file}`}
        alt={name}
        style={{
          height: heights[size],
          width: "auto",
          maxWidth: "180px",
          objectFit: "contain",
          opacity: 0.9,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLImageElement).style.opacity = "1")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLImageElement).style.opacity = "0.9")
        }
        onError={(e) => {
          const img = e.target as HTMLImageElement
          img.replaceWith(
            Object.assign(document.createElement("span"), {
              textContent: name,
              style:
                "font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;",
            }),
          )
        }}
      />
    </div>
  )
}
const PartnersSection = () => {
  return (
    <div>
      PartnersSection
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "4px",
              height: "24px",
              backgroundColor: "var(--color-f1-red)",
            }}
          />
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
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#ffffff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.3)")
          }
        >
          View All →
        </Link>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "1px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
          {GLOBAL_PARTNERS.map((p) => (
            <PartnerLogo
              key={p.name}
              name={p.name}
              file={p.file}
              folder="global-partners"
              size="lg"
            />
          ))}
        </div>
      </div>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "1px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
          {OFFICIAL_PARTNERS.map((p) => (
            <PartnerLogo
              key={p.name}
              name={p.name}
              file={p.file}
              folder="official-partners"
              size="md"
            />
          ))}
        </div>
      </div>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.015)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
          {REGIONAL_PARTNERS.map((p) => (
            <PartnerLogo
              key={p.name}
              name={p.name}
              file={p.file}
              folder="regional-partners"
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnersSection
