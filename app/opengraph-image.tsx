import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0d0d10 0%, #08080a 70%)",
          color: "#f3efe8",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#b89258", textTransform: "uppercase" }}>
          Live Entertainment &middot; Nightlife
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 600, marginTop: 24, letterSpacing: -2 }}>
          <span>STUDIO&nbsp;</span>
          <span style={{ color: "#d4af6a" }}>XO</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
