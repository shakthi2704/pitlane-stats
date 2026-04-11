import Link from "next/link"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    F1: [
      { label: "Driver Standings", href: "/sports/f1/standings" },
      { label: "Constructor Standings", href: "/sports/f1/standings" },
      { label: "Race Calendar", href: "/sports/f1/races" },
      { label: "Circuit Info", href: "/sports/f1/circuits" },
      { label: "Latest News", href: "/sports/f1/news" },
    ],
    Sports: [
      { label: "Formula 1", href: "/sports/f1" },
      { label: "MotoGP", href: "#" },
      { label: "Football", href: "#" },
      { label: "Cricket", href: "#" },
      { label: "Basketball", href: "#" },
    ],
    About: [
      { label: "Data Sources", href: "#" },
      { label: "API", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
    ],
  }

  const socials = [
    {
      label: "X",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.737-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ]

  return (
    <footer
      className="mt-20 border-t border-white/5"
      style={{ backgroundColor: "#080808" }}
    >
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4 group">

              <span
                className="text-white font-bold text-lg italic border-b-4 border-white"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.05em",
                }}
              >
                SPORTSPHERE
              </span>
            </Link>

            <p className="text-white/30 text-sm leading-relaxed mb-6 max-w-xs">
              Live standings, race results, lap times and circuit stats for the
              world's biggest motorsports.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all duration-200"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p
                className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {category}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/35 hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t border-white/5"
        style={{ backgroundColor: "#050505" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-[11px] text-white/20 tracking-wider"
            style={{ fontFamily: "var(--font-display)" }}
          >
            © {currentYear} PITLANE STATS. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[11px] text-white/15">
            Data provided by{" "}
            <a
              href="https://jolpi.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              Jolpica F1 API
            </a>{" "}
            · Not affiliated with any official ports organization.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
