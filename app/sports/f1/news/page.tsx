"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"

interface Article {
    title: string
    description: string | null
    url: string
    imageUrl: string | null
    source: string
    publishedAt: string | null
}

function timeAgo(iso: string | null): string {
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

const ArticleCard = ({ article, featured }: { article: Article; featured?: boolean }) => {
    const [imgError, setImgError] = useState(false)
    const sourceColor = SOURCE_COLORS[article.source] ?? "#E10600"
    const slug = encodeURIComponent(btoa(article.url))

    return (
        <Link href={`/sports/f1/news/${slug}`} style={{ textDecoration: "none", display: "block" }}>
            <div
                style={{
                    position: "relative", overflow: "hidden",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: `3px solid ${sourceColor}`,
                    height: featured ? "420px" : "280px",
                    transition: "all 0.2s", cursor: "pointer",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.6)"
                    el.style.borderColor = "rgba(255,255,255,0.15)"
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                    el.style.borderColor = "rgba(255,255,255,0.06)"
                }}
            >
                {article.imageUrl && !imgError ? (
                    <div style={{ position: "relative", height: featured ? "220px" : "140px", overflow: "hidden", backgroundColor: "#111" }}>
                        <img src={article.imageUrl} alt={article.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={() => setImgError(true)} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                    </div>
                ) : (
                    <div style={{ height: featured ? "220px" : "140px", background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", opacity: 0.1 }}>F1</span>
                    </div>
                )}

                <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: sourceColor, fontWeight: 700 }}>{article.source}</span>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>{timeAgo(article.publishedAt)}</span>
                    </div>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: featured ? "1.1rem" : "0.88rem",
                        fontWeight: 400, color: "#ffffff", margin: "0 0 8px 0", lineHeight: 1.3,
                        display: "-webkit-box", WebkitLineClamp: featured ? 3 : 2,
                        WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                    }}>{article.title}</p>
                    {article.description && (
                        <p style={{
                            fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        }}>{article.description}</p>
                    )}
                </div>
                <div style={{ position: "absolute", bottom: "14px", right: "16px", fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                    READ →
                </div>
            </div>
        </Link>
    )
}

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<"all" | "Autosport" | "BBC Sport">("all")

    useEffect(() => {
        setLoading(true)
        fetch("/api/f1/news")
            .then(r => r.json())
            .then(data => {
                if (data.articles?.length > 0) setArticles(data.articles)
                else setError("No articles available right now.")
            })
            .catch(() => setError("Failed to load news."))
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === "all" ? articles : articles.filter(a => a.source === filter)
    const featured = filtered.slice(0, 2)
    const rest = filtered.slice(2)

    return (
        <div>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 0" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
                        <div>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-f1-red)", marginBottom: "8px" }}>Formula 1</p>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0", lineHeight: 0.9, letterSpacing: "-0.03em" }}>LATEST NEWS</h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {articles.length > 0 ? `${articles.length} articles from Autosport & BBC Sport` : "Live from Autosport & BBC Sport"}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                            {(["all", "Autosport", "BBC Sport"] as const).map(s => (
                                <button key={s} onClick={() => setFilter(s)} style={{
                                    fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                    padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                    borderColor: filter === s ? "var(--color-f1-red)" : "rgba(255,255,255,0.1)",
                                    backgroundColor: filter === s ? "var(--color-f1-red)" : "transparent",
                                    color: filter === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                                }}>{s === "all" ? "All Sources" : s}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "20px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite" }} />
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.74)", letterSpacing: "0.06em" }}>Live feed · updates every 10 minutes</span>
                        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading && <F1Loader message="LOADING NEWS..." />}
                {!loading && error && (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>{error}</p>
                    </div>
                )}
                {!loading && !error && filtered.length > 0 && (
                    <>
                        {featured.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "6px", marginBottom: "6px" }}>
                                {featured.map((a, i) => <ArticleCard key={i} article={a} featured />)}
                            </div>
                        )}
                        {rest.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "6px" }}>
                                {rest.map((a, i) => <ArticleCard key={i} article={a} />)}
                            </div>
                        )}
                    </>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>NO ARTICLES FROM {filter.toUpperCase()}</p>
                    </div>
                )}
            </div>
        </div>
    )
}