"use client"

interface F1LoaderProps {
  message?: string
  fullScreen?: boolean
}

const F1Loader = ({
  message = "LOADING...",
  fullScreen = false,
}: F1LoaderProps) => {
  return (
    <div
      style={{
        minHeight: fullScreen ? "80vh" : "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* F1 car animation */}
        <div
          style={{
            position: "relative",
            width: "120px",
            margin: "0 auto 20px",
            height: "40px",
          }}
        >
          {/* Track line */}
          <div
            style={{
              position: "absolute",
              bottom: "6px",
              left: 0,
              right: 0,
              height: "2px",
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          {/* Moving red line (car) */}
          <div
            style={{
              position: "absolute",
              bottom: "5px",
              left: 0,
              height: "4px",
              width: "40px",
              backgroundColor: "var(--color-f1-red)",
              animation: "f1slide 1.2s ease-in-out infinite",
              borderRadius: "0 2px 2px 0",
            }}
          />

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              bottom: "3px",
              left: 0,
              height: "8px",
              width: "20px",
              backgroundColor: "var(--color-f1-red)",
              animation: "f1slide 1.2s ease-in-out infinite",
              filter: "blur(6px)",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Message */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            margin: 0,
          }}
        >
          {message}
        </p>

        <style>{`
          @keyframes f1slide {
            0% { transform: translateX(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateX(80px); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default F1Loader
