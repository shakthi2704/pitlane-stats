"use client"

import { useEffect, useState } from "react"

const words = [
  "STANDINGS",
  "RESULTS",
  "RANKINGS",
  "RECORDS",
  "LAP TIMES",
  "HISTORY",
]

const TYPE_SPEED = 80 // ms per character typing
const DELETE_SPEED = 40 // ms per character deleting
const PAUSE_AFTER = 1800 // ms to hold the full word
const PAUSE_BEFORE = 300 // ms pause before typing next word

export default function AnimatedTitle() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<
    "typing" | "pausing" | "deleting" | "waiting"
  >("typing")

  useEffect(() => {
    const word = words[wordIndex]

    if (phase === "typing") {
      if (displayed.length < word.length) {
        const t = setTimeout(
          () => setDisplayed(word.slice(0, displayed.length + 1)),
          TYPE_SPEED,
        )
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase("deleting"), PAUSE_AFTER)
        return () => clearTimeout(t)
      }
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed((d) => d.slice(0, -1)),
          DELETE_SPEED,
        )
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length)
          setPhase("typing")
        }, PAUSE_BEFORE)
        return () => clearTimeout(t)
      }
    }
  }, [displayed, phase, wordIndex])

  return (
    <h1
      className="font-black leading-none mb-4"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2.8rem, 6vw, 5rem)",
        letterSpacing: "-0.02em",
      }}
    >
      LIVE STATS &amp;
      <br />
      <span style={{ color: "rgba(255,255,255,0.18)" }}>
        {displayed}
        {/* Blinking cursor */}
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "0.85em",
            backgroundColor: "var(--color-f1-red)",
            marginLeft: "4px",
            verticalAlign: "middle",
            animation: "cursor-blink 1s step-end infinite",
          }}
        />
      </span>
    </h1>
  )
}
