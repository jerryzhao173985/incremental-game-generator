import type { ReactNode } from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import { Analytics } from "@vercel/analytics/react"
import ErrorBoundary from "@/components/error-boundary"
import { Suspense } from "react"

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Incremental Game Generator",
  description: "Watch as AI builds a game through five progressive iterations",
  icons: {
    icon: [{ url: "/icon.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ErrorBoundary>{children}</ErrorBoundary>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
