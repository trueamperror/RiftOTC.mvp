import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "RIFT OTC | Darknet Trading Protocol",
  description: "AI-Powered OTC Trading in the shadows. Enter the RIFT.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0e14",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased ${_jetbrainsMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
