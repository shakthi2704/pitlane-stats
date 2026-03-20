import Link from "next/link"
import AnimatedTitle from "@/components/animated-title"

const sports = [
  {
    id: "f1",
    name: "Formula 1",
    subtitle: "Open-wheel racing",
    href: "/sports/f1",
    active: true,
    color: "#E10600",
    glow: "rgba(225,6,0,0.6)",
    bg: "#3d0400",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M8 36 C8 36 16 28 32 28 C48 28 56 36 56 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="18" cy="38" rx="6" ry="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <ellipse cx="46" cy="38" rx="6" ry="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M12 36 L8 32 L12 26 L28 24 L36 24 L48 26 L56 30 L52 36" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M28 24 L30 18 L36 18 L38 24" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="18" cy="38" r="2.5" fill="currentColor" />
        <circle cx="46" cy="38" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "motogp",
    name: "MotoGP",
    subtitle: "Motorcycle racing",
    href: "#",
    active: false,
    color: "#FF6B00",
    glow: "rgba(255,107,0,0.55)",
    bg: "#2d1500",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <ellipse cx="16" cy="42" rx="8" ry="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <ellipse cx="48" cy="42" rx="8" ry="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M24 42 L40 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 38 L32 26 L42 26 L48 34" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
        <path d="M32 26 L32 20 L38 18 L40 22" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="42" r="3" fill="currentColor" />
        <circle cx="48" cy="42" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "football",
    name: "Football",
    subtitle: "The beautiful game",
    href: "#",
    active: false,
    color: "#00A651",
    glow: "rgba(0,166,81,0.5)",
    bg: "#002d18",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <polygon points="32,16 38,22 36,30 28,30 26,22" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polygon points="38,22 46,24 48,32 42,36 36,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polygon points="42,36 40,44 32,46 26,42 28,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polygon points="26,42 18,42 14,34 20,28 28,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polygon points="20,28 18,20 26,16 32,16 26,22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "cricket",
    name: "Cricket",
    subtitle: "Bat & ball",
    href: "#",
    active: false,
    color: "#00B4D8",
    glow: "rgba(0,180,216,0.5)",
    bg: "#00222d",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M38 14 L50 26 C52 28 52 32 50 34 L28 56 C26 58 22 58 20 56 L18 54 C16 52 16 48 18 46 L40 24 C42 22 42 18 38 14Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M38 14 L42 10 L54 22 L50 26" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M14 50 L10 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="54" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "basketball",
    name: "Basketball",
    subtitle: "Hoops action",
    href: "#",
    active: false,
    color: "#F87831",
    glow: "rgba(248,120,49,0.55)",
    bg: "#2d1800",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M12 32 L52 32M32 12 L32 52" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 20 C22 22 26 28 26 32 C26 36 22 42 14 44" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M50 20 C42 22 38 28 38 32 C38 36 42 42 50 44" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "tennis",
    name: "Tennis",
    subtitle: "Grand Slam",
    href: "#",
    active: false,
    color: "#CDDC39",
    glow: "rgba(205,220,57,0.5)",
    bg: "#222400",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="28" cy="26" r="16" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M14 26 L42 26M28 10 L28 42" stroke="currentColor" strokeWidth="1.5" />
        <path d="M40 38 L54 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 34 L40 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "nfl",
    name: "NFL",
    subtitle: "American football",
    href: "#",
    active: false,
    color: "#5b9bd5",
    glow: "rgba(91,155,213,0.5)",
    bg: "#00152d",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <ellipse cx="32" cy="32" rx="22" ry="14" stroke="currentColor" strokeWidth="2.5" fill="none" transform="rotate(-30 32 32)" />
        <line x1="28" y1="22" x2="36" y2="42" stroke="currentColor" strokeWidth="1.5" />
        <line x1="22" y1="30" x2="42" y2="26" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="35" x2="40" y2="31" stroke="currentColor" strokeWidth="1.5" />
        <line x1="22" y1="40" x2="40" y2="36" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "golf",
    name: "Golf",
    subtitle: "Major championships",
    href: "#",
    active: false,
    color: "#2ECC71",
    glow: "rgba(46,204,113,0.5)",
    bg: "#002d18",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <line x1="32" y1="12" x2="32" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 16 L44 22 L32 28Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <ellipse cx="32" cy="54" rx="10" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="32" cy="54" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

function SportCard({ sport }: { sport: typeof sports[0] }) {
  const content = (
    <div
      className="relative overflow-hidden h-full group"
      style={{ backgroundColor: sport.bg, isolation: "isolate" }}
    >
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: sport.active ? sport.color : `${sport.color}55` }}
      />

      {/* Bottom-right atmospheric glow */}
      <div
        className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-100"
        style={{
          backgroundColor: sport.glow,
          opacity: sport.active ? 0.45 : 0.3,
        }}
      />

      {/* Large watermark icon */}
      <div
        className="absolute -bottom-2 -right-2 w-24 h-24 transition-all duration-500 group-hover:scale-110"
        style={{
          color: sport.color,
          opacity: sport.active ? 0.25 : 0.15,
        }}
      >
        {sport.icon}
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col" style={{ transform: "translateZ(0)", WebkitFontSmoothing: "antialiased" }}>

        {/* Top — icon + status */}
        <div className="flex items-start justify-between mb-auto">
          <div
            className="w-10 h-10 p-2 transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${sport.color}25`,
              color: sport.color,
              opacity: sport.active ? 1 : 0.7,
            }}
          >
            {sport.icon}
          </div>

          {sport.active ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sport.color }} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)", color: sport.color }}>
                Live
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-0.5" style={{ fontFamily: "var(--font-display)", color: `${sport.color}70` }}>
              Soon
            </span>
          )}
        </div>

        {/* Bottom — name + cta */}
        <div className="mt-4">
          <h2
            className="font-semibold leading-none mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              letterSpacing: "-0.01em",
              color: sport.active ? "#ffffff" : `${sport.color}90`,
            }}
          >
            {sport.name}
          </h2>
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            {sport.subtitle}
          </p>

          {sport.active ? (
            <div className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300" style={{ color: sport.color }}>
              <div className="h-[1px] w-5 group-hover:w-8 transition-all duration-300" style={{ backgroundColor: sport.color }} />
              <span className="text-[11px] font-black tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                View Stats
              </span>
            </div>
          ) : (
            <div className="h-[1px] w-5" style={{ backgroundColor: `${sport.color}40` }} />
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${sport.color}10 0%, transparent 60%)` }}
      />
    </div>
  )

  return sport.active
    ? <Link href={sport.href} className="block h-full">{content}</Link>
    : <div className="h-full">{content}</div>
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 noise-bg">
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.3em] mb-3 font-semibold uppercase"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-f1-red)" }}
        >
          Your Global Sports Hub
        </p>
        <AnimatedTitle />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", maxWidth: "480px" }}>
          In-depth statistics, live standings, and race results for the world's biggest sports.
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {sports.map((sport) => (
          <div
            key={sport.id}
            className="h-52"
            style={{ borderRight: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <SportCard sport={sport} />
          </div>
        ))}
      </div>

      <p
        className="text-center mt-6 text-[11px] tracking-widest uppercase"
        style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.12)" }}
      >
        More sports coming soon · MotoGP · Football · Cricket · Basketball
      </p>
    </div>
  )
}