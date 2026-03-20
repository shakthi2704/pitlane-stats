import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/f1/Footer"


export const metadata: Metadata = {
  title: "PitLane Stats — Sports Statistics",
  description: "Live standings, race results, and in-depth stats for F1 and more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-background/80">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 f1-bg rounded flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8C2 8 4 5 8 5C12 5 14 8 14 8C14 8 12 11 8 11C4 11 2 8 2 8Z" stroke="white" strokeWidth="1.5" fill="none" />
                  <circle cx="8" cy="8" r="1.5" fill="white" />
                </svg>
              </div>
              <span
                className="font-black text-xl tracking-tight text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.02em" }}
              >
                PITLANE<span className="f1-accent">STATS</span>
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <a
                href="/"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
              >
                ALL SPORTS
              </a>
              <a
                href="/sports/f1"
                className="px-3 py-1.5 text-sm text-white font-semibold transition-colors rounded-md bg-white/5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
              >
                F1
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
