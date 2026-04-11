import Link from "next/link"

const Header = () => {
  return (
    <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">

          <span
            className="font-black text-2xl tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="font-black text-xl tracking-tight text-white italic border-b-4 border-white">
              SPORTSPHERE
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
            }}
          >
            ALL SPORTS
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
