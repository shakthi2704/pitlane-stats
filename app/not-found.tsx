import Link from "next/link"

Link

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-6">
      <div className="text-center">
        {/* Big 404 */}
        <h1 className="text-7xl md:text-9xl font-extrabold text-gray-900 dark:text-white">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Looks like this page went off the pitch{" "}
          <span className="text-lg">⚽</span>
        </p>

        {/* Button */}
        <Link
          href="/sports/f1"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
