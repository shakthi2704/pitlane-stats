import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider"
import Link from "next/link"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"

export const metadata: Metadata = {
  title: "PitLane Stats — Sports Statistics",
  description:
    "Live standings, race results, and in-depth stats for F1 and more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
