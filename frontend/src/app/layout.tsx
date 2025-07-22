import type { Metadata } from "next"
import { Inter } from "next/font/google"
import 'react-day-picker/dist/style.css'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Landing Page",
  description: "A modern and elegant landing page built with Next.js and Tailwind CSS",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
