"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED } from "@/lib/motogp/motogp-constants"
import Loader from "@/components/layout/Loader"



interface Article {
    title: string
    description: string | null
    url: string
    imageUrl: string | null
    source: string
    publishedAt: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
    if (!iso) return ""
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(iso: string | null): string {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPNewsDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [article, setArticle] = useState<Article | null>(null)
    const [related, setRelated] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!id) return

        let articleUrl: string
        try {
            articleUrl = atob(decodeURIComponent(id))
        } catch {
            setNotFound(true)
            setLoading(false)
            return
        }

        fetch("/api/motogp/news")
            .then(r => r.json())
            .then(data => {
                const articles: Article[] = data.articles ?? []
                const found = articles.find(a => a.url === articleUrl)
                if (!found) { setNotFound(true); return }
                setArticle(found)
                setRelated(articles.filter(a => a.url !== articleUrl).slice(0, 3))
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loader message="LOADING CIRCUIT DETAILS..." />

    if (notFound || !article) return (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <p style={{ fontFamily: "var(--font-display)", color: MOTOGP_RED, fontSize: "1.5rem", letterSpacing: "0.1em" }}>ARTICLE NOT FOUND</p>
            <Link href="/sports/motogp/news" style={{ fontFamily: "var(--font-sans)", color: "#555", fontSize: "0.85rem", textDecoration: "none" }}>
                ← Back to News
            </Link>
        </div>
    )

    const sourceColor = "var(--accent)"

    return (
        <div>
            {/* Hero */}
            <div style={{ position: "relative", minHeight: "420px", overflow: "hidden", background: "#111" }}>
                {article.imageUrl && (
                    <>
                        <img
                            src={article.imageUrl} alt={article.title}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #0a0a0a 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 100%)" }} />
                    </>
                )}
                {/* Left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: sourceColor }} />

                <div className="max-w-4xl" style={{
                    margin: "0 auto", padding: "48px 24px 40px",
                    position: "relative", zIndex: 10,
                    minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                    {/* Breadcrumb */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Link href="/sports/motogp" style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "#444", textDecoration: "none", letterSpacing: "0.12em" }}>
                            MOTOGP
                        </Link>
                        <span style={{ color: "#222" }}>/</span>
                        <Link href="/sports/motogp/news" style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "#444", textDecoration: "none", letterSpacing: "0.12em" }}>
                            NEWS
                        </Link>
                    </div>

                    {/* Article */}
                    <div>
                        {/* Source + time */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "0.7rem",
                                letterSpacing: "0.12em", textTransform: "uppercase",
                                color: "#fff", background: sourceColor,
                                padding: "4px 12px", fontWeight: 700,
                            }}>
                                {article.source}
                            </span>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                                {formatDate(article.publishedAt)}
                            </span>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.25)" }}>
                                {timeAgo(article.publishedAt)}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(1.8rem, 4vw, 3rem)",
                            fontWeight: 700, color: "#ffffff",
                            margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.01em",
                        }}>
                            {article.title}
                        </h1>

                        {/* Description */}
                        {article.description && (
                            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 24px", maxWidth: "640px" }}>
                                {article.description}
                            </p>
                        )}

                        {/* CTA */}
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.8rem",
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    color: "#fff", background: sourceColor,
                                    padding: "14px 32px", textDecoration: "none",
                                    fontWeight: 700, transition: "opacity 0.2s", display: "inline-block",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                            >
                                Read Full Article on {article.source} →
                            </a>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
                                Opens on {article.source}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
                <div className="max-w-4xl" style={{ margin: "0 auto", padding: "48px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ width: "4px", height: "24px", background: "var(--accent)" }} />
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.1em", color: "#fff", margin: 0, textTransform: "uppercase" }}>
                            More MotoGP News
                        </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "6px" }}>
                        {related.map((a, i) => {
                            const slug = encodeURIComponent(btoa(a.url))
                            const color = "var(--accent)"
                            return (
                                <Link key={i} href={`/sports/motogp/news/${slug}`} style={{ textDecoration: "none" }}>
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            borderTop: `3px solid ${color}`,
                                            padding: "16px", transition: "all 0.2s", cursor: "pointer",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                                                {a.source}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)" }}>
                                                {timeAgo(a.publishedAt)}
                                            </span>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.3 }}>
                                            {a.title}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}