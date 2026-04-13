import { NextResponse } from "next/server"

interface NewsItem {
    title: string
    description: string | null
    url: string
    imageUrl: string | null
    source: string
    publishedAt: string | null
}

function extractText(xml: string, tag: string): string | null {
    const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i")
    const match = xml.match(re)
    return match ? match[1].trim() : null
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
    const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i")
    const match = xml.match(re)
    return match ? match[1].trim() : null
}

function parseRSS(xml: string, sourceName: string): NewsItem[] {
    const items: NewsItem[] = []
    const itemBlocks = xml.split(/<item[\s>]/)
    itemBlocks.shift()

    for (const block of itemBlocks) {
        const title = extractText(block, "title")
        const url = extractText(block, "link") ?? extractAttr(block, "link", "href")
        const description = extractText(block, "description")
        const pubDate = extractText(block, "pubDate") ?? extractText(block, "dc:date")

        let imageUrl =
            extractAttr(block, "media:content", "url") ??
            extractAttr(block, "media:thumbnail", "url") ??
            extractAttr(block, "enclosure", "url") ??
            null

        if (!imageUrl && description) {
            const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i)
            if (imgMatch) imageUrl = imgMatch[1]
        }

        if (!title || !url) continue

        items.push({
            title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
            description: description
                ? description.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim().slice(0, 200)
                : null,
            url,
            imageUrl,
            source: sourceName,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
        })
    }

    return items
}

const FEEDS = [
    { url: "https://www.autosport.com/rss/motogp/news/", source: "Autosport" },
    { url: "https://feeds.bbci.co.uk/sport/motorsport/rss.xml", source: "BBC Sport" },
    { url: "https://www.crash.net/rss/motogp", source: "Crash.net" },
]

export async function GET() {
    const results = await Promise.allSettled(
        FEEDS.map(async ({ url, source }) => {
            const res = await fetch(url, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; PitlaneStats/1.0)" },
                signal: AbortSignal.timeout(5000),
                next: { revalidate: 600 },
            })
            if (!res.ok) throw new Error(`${source} returned ${res.status}`)
            const xml = await res.text()
            return parseRSS(xml, source)
        })
    )

    const allItems: NewsItem[] = []
    const errors: string[] = []

    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === "fulfilled") {
            allItems.push(...result.value)
        } else {
            errors.push(`${FEEDS[i].source}: ${result.reason?.message ?? "Failed"}`)
            console.warn(`[motogp-news] Feed failed: ${FEEDS[i].source}`, result.reason)
        }
    }

    const seen = new Set<string>()
    const deduped = allItems.filter(item => {
        const key = item.title.toLowerCase().slice(0, 40)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    deduped.sort((a, b) => {
        if (!a.publishedAt) return 1
        if (!b.publishedAt) return -1
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    return NextResponse.json({
        articles: deduped.slice(0, 40),
        errors: errors.length > 0 ? errors : undefined,
        sources: FEEDS.map(f => f.source),
    })
}