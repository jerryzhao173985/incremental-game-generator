import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 96,
        background: "linear-gradient(to bottom right, #6b46c1, #4338ca)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "50%",
      }}
    >
      IG
    </div>,
    { ...size },
  )
}
