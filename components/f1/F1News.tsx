"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Article {
    title: string
    description: string | null
    url: string
    imageUrl: string | null
    source: string
    publishedAt: string | null
}

const timeAgo = (iso: string | null): string => {
    if (!iso) return ""
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

const SOURCE_COLORS: Record<string, string> = {
    "Autosport": "#E10600",
    "BBC Sport": "#BB1919",
}

const F1News = () => {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/f1/news")
            .then(r => r.json())
            .then(data => setArticles((data.articles ?? []).slice(0, 4)))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading || articles.length === 0) return null

    return (
        <div style={{ marginBottom: "40px" }} className="bg-black p-6">
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "4px", height: "24px", backgroundColor: "var(--accent)" }} />
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        LATEST NEWS
                    </h2>
                </div>
                <Link href="/sports/f1/news" style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                    All News →
                </Link>
            </div>

            {/* 4 article cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "6px" }}>
                {articles.map((article, i) => {
                    const slug = encodeURIComponent(btoa(article.url))
                    const sourceColor = "var(--accent)"

                    return (
                        <Link key={i} href={`/sports/f1/news/${slug}`} style={{ textDecoration: "none" }}>
                            <div
                                style={{
                                    overflow: "hidden",
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderTop: `3px solid ${sourceColor}`,
                                    transition: "all 0.2s", cursor: "pointer",
                                    height: "100%",
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLElement
                                    el.style.transform = "translateY(-3px)"
                                    el.style.background = "rgba(255,255,255,0.04)"
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLElement
                                    el.style.transform = "translateY(0)"
                                    el.style.background = "rgba(255,255,255,0.02)"
                                }}
                            >
                                {/* Image */}
                                {article.imageUrl && (
                                    <div style={{ height: "130px", overflow: "hidden", backgroundColor: "#111" }}>
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{ padding: "12px 14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: sourceColor, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400 }}>
                                            {article.source}
                                        </span>
                                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)" }}>
                                            {timeAgo(article.publishedAt)}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontFamily: "var(--font-display)", fontSize: "0.85rem",
                                        fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1.3,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical" as const,
                                        overflow: "hidden",
                                    }}>{article.title}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default F1News