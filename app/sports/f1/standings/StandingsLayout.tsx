"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function StandingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { label: "Drivers", href: "/sports/f1/standings/drivers" },
    { label: "Constructors", href: "/sports/f1/standings/constructors" },
  ]

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "#0d0d0d",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: "flex", alignItems: "center" }}>
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  padding: "12px 20px",
                  textDecoration: "none",
                  color:
                    pathname === tab.href ? "#ffffff" : "rgba(255,255,255,0.4)",
                  borderBottom:
                    pathname === tab.href
                      ? "2px solid var(--color-f1-red)"
                      : "2px solid transparent",
                  transition: "color 0.2s",
                  display: "block",
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div>{children}</div>
    </div>
  )
}
