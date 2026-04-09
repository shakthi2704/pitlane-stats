import AnimatedTitle from "@/components/layout/AnimatedTitle"
import SportCard from "@/components/layout/SportsCard"
import { Sport } from "@/types/sport"

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
        <path
          d="M8 36 C8 36 16 28 32 28 C48 28 56 36 56 36"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse
          cx="18"
          cy="38"
          rx="6"
          ry="6"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <ellipse
          cx="46"
          cy="38"
          rx="6"
          ry="6"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M12 36 L8 32 L12 26 L28 24 L36 24 L48 26 L56 30 L52 36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M28 24 L30 18 L36 18 L38 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="18" cy="38" r="2.5" fill="currentColor" />
        <circle cx="46" cy="38" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "motogp",
    name: "MotoGP",
    subtitle: "Motorcycle racing",
    href: "/sports/motogp",
    active: true,
    color: "#FF6B00",
    glow: "rgba(255,107,0,0.55)",
    bg: "#2d1500",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <ellipse
          cx="16"
          cy="42"
          rx="8"
          ry="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <ellipse
          cx="48"
          cy="42"
          rx="8"
          ry="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M24 42 L40 42"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 38 L32 26 L42 26 L48 34"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 26 L32 20 L38 18 L40 22"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="16" cy="42" r="3" fill="currentColor" />
        <circle cx="48" cy="42" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "football",
    name: "Football",
    subtitle: "The beautiful game",
    href: "sports/football",
    active: true,
    color: "#00A651",
    glow: "rgba(0,166,81,0.5)",
    bg: "#002d18",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <polygon
          points="32,16 38,22 36,30 28,30 26,22"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon
          points="38,22 46,24 48,32 42,36 36,30"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon
          points="42,36 40,44 32,46 26,42 28,30"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon
          points="26,42 18,42 14,34 20,28 28,30"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon
          points="20,28 18,20 26,16 32,16 26,22"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "cricket",
    name: "Cricket",
    subtitle: "Bat & ball",
    href: "/sports/cricket",
    active: true,
    color: "#00B4D8",
    glow: "rgba(0,180,216,0.5)",
    bg: "#00222d",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path
          d="M38 14 L50 26 C52 28 52 32 50 34 L28 56 C26 58 22 58 20 56 L18 54 C16 52 16 48 18 46 L40 24 C42 22 42 18 38 14Z"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M38 14 L42 10 L54 22 L50 26"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M14 50 L10 54"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
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
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M12 32 L52 32M32 12 L32 52"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14 20 C22 22 26 28 26 32 C26 36 22 42 14 44"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M50 20 C42 22 38 28 38 32 C38 36 42 42 50 44"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
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
        <circle
          cx="28"
          cy="26"
          r="16"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M14 26 L42 26M28 10 L28 42"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M40 38 L54 52"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M36 34 L40 38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
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
        <ellipse
          cx="32"
          cy="32"
          rx="22"
          ry="14"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          transform="rotate(-30 32 32)"
        />
        <line
          x1="28"
          y1="22"
          x2="36"
          y2="42"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="22"
          y1="30"
          x2="42"
          y2="26"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="35"
          x2="40"
          y2="31"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="22"
          y1="40"
          x2="40"
          y2="36"
          stroke="currentColor"
          strokeWidth="1.5"
        />
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
        <line
          x1="32"
          y1="12"
          x2="32"
          y2="52"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M32 16 L44 22 L32 28Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        <ellipse
          cx="32"
          cy="54"
          rx="10"
          ry="3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="32" cy="54" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 noise-bg">
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.3em] mb-3 font-semibold uppercase"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-f1-red)",
          }}
        >
          Your Global Sports Hub
        </p>
        <AnimatedTitle />
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.875rem",
            maxWidth: "480px",
          }}
        >
          In-depth statistics, live standings, and race results for the world's
          biggest sports.
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {sports.map((sport) => (
          <div
            key={sport.id}
            className="h-52"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <SportCard sport={sport} />
          </div>
        ))}
      </div>

      <p
        className="text-center mt-6 text-[11px] tracking-widest uppercase"
        style={{
          fontFamily: "var(--font-display)",
          color: "rgba(255,255,255,0.12)",
        }}
      >
        More sports coming soon · MotoGP · Football · Cricket · Basketball
      </p>
    </div>
  )
}
