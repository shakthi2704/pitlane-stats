import Link from "next/link"
import { Sport } from "@/types/sport"

const SportCard = ({ sport }: { sport: Sport }) => {
  const content = (
    <div
      className="relative overflow-hidden h-full group"
      style={{ backgroundColor: sport.bg, isolation: "isolate" }}
    >
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          backgroundColor: sport.active ? sport.color : `${sport.color}55`,
        }}
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
      <div className="relative z-10 p-5 h-full flex flex-col">
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
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: sport.color }}
              />
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: sport.color }}
              >
                Live
              </span>
            </div>
          ) : (
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-0.5"
              style={{ color: `${sport.color}70` }}
            >
              Soon
            </span>
          )}
        </div>

        {/* Bottom — name + CTA */}
        <div className="mt-4">
          <h2
            className="font-semibold leading-none mb-1"
            style={{
              fontSize: "1.75rem",
              letterSpacing: "-0.01em",
              color: sport.active ? "#ffffff" : `${sport.color}90`,
            }}
          >
            {sport.name}
          </h2>
          <p
            className="text-xs mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {sport.subtitle}
          </p>

          {sport.active ? (
            <div
              className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
              style={{ color: sport.color }}
            >
              <div
                className="h-[1px] w-5 group-hover:w-8 transition-all duration-300"
                style={{ backgroundColor: sport.color }}
              />
              <span className="text-[11px] font-black tracking-[0.15em] uppercase">
                View Stats
              </span>
            </div>
          ) : (
            <div
              className="h-[1px] w-5"
              style={{ backgroundColor: `${sport.color}40` }}
            />
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${sport.color}10 0%, transparent 60%)`,
        }}
      />
    </div>
  )

  return sport.active ? (
    <Link href={sport.href} className="block h-full">
      {content}
    </Link>
  ) : (
    <div className="h-full">{content}</div>
  )
}

export default SportCard
