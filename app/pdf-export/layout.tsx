import type React from "react"
import "../globals.css"
import "./print.css"

export const metadata = {
  title: "PDF Export - Discovery Copilot",
  description: "Export your discovery questions and notes as a PDF",
}

export default function PDFExportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white font-sans text-[#353740]">{children}</body>
    </html>
  )
}
