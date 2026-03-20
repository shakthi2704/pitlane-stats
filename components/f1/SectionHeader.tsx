import Link from "next/link"

interface SectionHeaderProps {
    title: string
    href?: string
    label?: string
}

const SectionHeader = ({
    title,
    href,
    label = "View All",
}: SectionHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[var(--color-f1-red)]" />
                <h2
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                >
                    {title}
                </h2>
            </div>

            {href && (
                <Link
                    href={href}
                    className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/30 hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {label}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M1 6H11M6 1L11 6L6 11"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>
            )}
        </div>
    )
}

export default SectionHeader