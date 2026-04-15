import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "FPV Compass — FPV Freestyle Trickionary & Skill Tree";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0a0f1e 0%, #0f172a 55%, #064e3b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM16 8L9.5 9.5L8 16L14.5 14.5L16 8Z"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            FPV Compass
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>The FPV Freestyle</span>
            <span style={{ color: "#10b981" }}>Trickionary & Skill Tree</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#94a3b8",
              maxWidth: 960,
              lineHeight: 1.35,
            }}
          >
            Every trick in the right order, linked to the best community
            tutorials.
          </div>
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#10b981",
              color: "#0a0f1e",
              padding: "18px 32px",
              borderRadius: 16,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Explore the Skill Tree
            <span style={{ fontSize: 32, fontWeight: 800 }}>→</span>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            fpv-compass.xyz
          </div>
        </div>
      </div>
    ),
    size,
  );
}
